import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Loader2, User } from 'lucide-react';

interface ProfileSetupModalProps {
    open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
    const [name, setName] = useState('');
    const saveProfile = useSaveCallerUserProfile();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        await saveProfile.mutateAsync({ name: name.trim() });
    };

    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
                        <User className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="font-display text-center text-xl">Welcome to Solano7m!</DialogTitle>
                    <DialogDescription className="text-center">
                        Let's set up your profile. What should we call you?
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="font-body">Your Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="font-body"
                            autoFocus
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full font-body"
                        disabled={!name.trim() || saveProfile.isPending}
                    >
                        {saveProfile.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                        ) : (
                            'Get Started'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
