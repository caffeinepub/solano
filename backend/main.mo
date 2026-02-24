import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    imageUrl : Text;
    category : Text;
    stockQuantity : Nat;
  };

  public type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  public type OrderItem = {
    productId : Nat;
    quantity : Nat;
    price : Nat;
  };

  public type StoreOrder = {
    orderId : Nat;
    items : [OrderItem];
    total : Nat;
    timestamp : Time.Time;
    status : Text;
  };

  var nextProductId = 1;
  var nextOrderId = 1;

  // Persistent storage
  let userProfilesMap = Map.empty<Principal, UserProfile>();
  let productsMap = Map.empty<Nat, Product>();
  let cartsMap = Map.empty<Principal, Map.Map<Nat, Nat>>();
  let userOrdersMap = Map.empty<Principal, Map.Map<Nat, StoreOrder>>();

  // User profile operations
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfilesMap.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfilesMap.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfilesMap.add(caller, profile);
  };

  // Product operations
  public shared ({ caller }) func createProduct(name : Text, description : Text, price : Nat, imageUrl : Text, category : Text, stockQuantity : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    let productId = nextProductId;
    nextProductId += 1;

    let product : Product = {
      id = productId;
      name;
      description;
      price;
      imageUrl;
      category;
      stockQuantity;
    };

    productsMap.add(productId, product);
    productId;
  };

  public query func getProduct(productId : Nat) : async ?Product {
    productsMap.get(productId);
  };

  public shared ({ caller }) func updateProduct(productId : Nat, name : Text, description : Text, price : Nat, imageUrl : Text, category : Text, stockQuantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    switch (productsMap.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let updatedProduct : Product = {
          id = productId;
          name;
          description;
          price;
          imageUrl;
          category;
          stockQuantity;
        };
        productsMap.add(productId, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    if (not productsMap.containsKey(productId)) {
      Runtime.trap("Product not found");
    };
    productsMap.remove(productId);
  };

  public query func listProducts() : async [Product] {
    productsMap.values().toArray();
  };

  // Cart operations
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    switch (productsMap.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let userCart = switch (cartsMap.get(caller)) {
          case (null) { Map.empty<Nat, Nat>() };
          case (?cart) { cart };
        };

        userCart.add(productId, quantity);
        cartsMap.add(caller, userCart);
      };
    };
  };

  public shared ({ caller }) func updateCartItem(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    switch (cartsMap.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) {
        if (not cart.containsKey(productId)) {
          Runtime.trap("Product not in cart");
        };
        cart.add(productId, quantity);
      };
    };
  };

  public shared ({ caller }) func removeCartItem(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };

    switch (cartsMap.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) {
        if (not cart.containsKey(productId)) {
          Runtime.trap("Product not in cart");
        };
        cart.remove(productId);
      };
    };
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (cartsMap.get(caller)) {
      case (null) { [] };
      case (?cart) {
        cart.entries().map(func((productId, quantity)) { { productId; quantity } }).toArray();
      };
    };
  };

  // Order operations
  public shared ({ caller }) func placeOrder() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let userCart = switch (cartsMap.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) { cart };
    };

    let cartItems = userCart.entries().toArray();
    if (cartItems.size() == 0) {
      Runtime.trap("Cart is empty");
    };

    let orderItems = cartItems.map(func((productId, quantity)) {
      let price = switch (productsMap.get(productId)) {
        case (null) { Runtime.trap("Product not found") };
        case (?product) { product.price };
      };
      { productId; quantity; price };
    });

    let total = orderItems.foldLeft(0, func(acc, item) { acc + (item.quantity * item.price) });

    let orderId = nextOrderId;
    nextOrderId += 1;

    let order : StoreOrder = {
      orderId;
      items = orderItems;
      total;
      timestamp = Time.now();
      status = "pending";
    };

    switch (userOrdersMap.get(caller)) {
      case (null) {
        let orders = Map.empty<Nat, StoreOrder>();
        orders.add(orderId, order);
        userOrdersMap.add(caller, orders);
      };
      case (?orders) {
        orders.add(orderId, order);
      };
    };

    cartsMap.remove(caller);
    orderId;
  };

  public query ({ caller }) func getOrders() : async [StoreOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    switch (userOrdersMap.get(caller)) {
      case (null) { [] };
      case (?orders) {
        orders.values().toArray().sort(func(o1 : StoreOrder, o2 : StoreOrder) : Order.Order {
          Nat.compare(o1.orderId, o2.orderId);
        });
      };
    };
  };
};
