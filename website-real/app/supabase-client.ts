import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

function hasValidSupabaseConfig() {
    if (!supabaseUrl || !supabaseKey) {
        return false;
    }

    return ![
        "supabase.com/dashboard/project/_/settings/api",
        "your-project-url",
        "your-anon-key",
        "your-publishable-key",
    ].some((placeholder) =>
        supabaseUrl.includes(placeholder) || supabaseKey.includes(placeholder)
    );
}

let cachedClient: SupabaseClient | null = null;

export const createClient = () => {
    if (!hasValidSupabaseConfig()) {
        throw new Error(
            "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY."
        );
    }

    cachedClient ??= createBrowserClient(supabaseUrl!, supabaseKey!);
    return cachedClient;
};

export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, property, receiver) {
        const client = createClient();
        const value = Reflect.get(client as object, property, receiver);
        return typeof value === "function" ? value.bind(client) : value;
    },
});