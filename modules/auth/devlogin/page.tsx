"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@heiso/core/components/ui/button";
import { Input } from "@heiso/core/components/ui/input";
import { Label } from "@heiso/core/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@heiso/core/components/ui/card";
import { useRouter } from "next/navigation";
import { checkAdminStatus, updateAdminPassword } from "./actions";

export default function DevLoginPage() {
    const [step, setStep] = useState<'login' | 'prompt'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLoginCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await checkAdminStatus(email);
        setLoading(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        if (result.lastLoginAt === null) {
            setStep('prompt');
        } else {
            // Normal Login
            doSignIn();
        }
    };

    const doSignIn = async () => {
        setLoading(true);
        const result = await signIn("credentials", {
            username: email, // auth.config uses 'username' field
            password: password,
            redirect: false,
        });

        if (result?.error) {
            setError("Login failed: " + result.error);
            setLoading(false);
        } else {
            router.push('/'); // Go to dashboard
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        const result = await updateAdminPassword(email, newPassword);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            // Use new password to sign in
            const loginResult = await signIn("credentials", {
                username: email,
                password: newPassword,
                redirect: false,
            });
            if (loginResult?.error) {
                setError("Password updated but login failed.");
                setLoading(false);
            } else {
                router.push('/');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Dev Login Channel</CardTitle>
                    <CardDescription>Internal Admin Access Only</CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 'login' && (
                        <form onSubmit={handleLoginCheck} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@heiso.io"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Checking..." : "Login"}
                            </Button>
                        </form>
                    )}

                    {step === 'prompt' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                                Recommendation: This is your first login. Would you like to update your password?
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setNewPassword(val);
                                        if (error === "Passwords do not match") {
                                            if (val === confirmPassword) setError('');
                                        } else {
                                            setError('');
                                        }
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setConfirmPassword(val);
                                        if (error === "Passwords do not match") {
                                            if (val === newPassword) setError('');
                                        } else {
                                            setError('');
                                        }
                                    }}
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={doSignIn}
                                    disabled={loading}
                                >
                                    Skip
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleUpdatePassword}
                                    disabled={!newPassword || !confirmPassword || loading}
                                >
                                    Update & Login
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
