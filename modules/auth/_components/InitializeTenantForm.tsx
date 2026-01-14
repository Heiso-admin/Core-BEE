"use client";

import { ActionButton } from "@heiso/core/components/primitives";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@heiso/core/components/ui/form";
import { Input } from "@heiso/core/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Header from "./header";

export default function InitializeTenantForm() {
    const t = useTranslations("auth.login"); // Reuse login translations or generic
    const router = useRouter();

    const schema = z.object({
        email: z.string().email(),
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof schema>) => {
        router.push(`/signup?email=${encodeURIComponent(data.email)}`);
    };

    return (
        <>
            <Header
                title="Initialize Workspace"
                description="This workspace has no owner. Please register the first administrator account."
            />
            <Form {...form}>
                <form
                    className="mt-6 mb-4 space-y-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <div className="flex flex-col space-y-1">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium leading-relaxed">
                                            Email
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="admin@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                    </div>

                    <ActionButton
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90"
                        loading={form.formState.isSubmitting}
                    >
                        Start Setup
                    </ActionButton>
                </form>
            </Form>
        </>
    );
}
