import { useRouter } from "next/router";

const pages = [
    "checkout",
    "order-received",
    "search",
    "user/addresses",
    "user/orders",
    "user/payments",
    "user/profile",
    "user/order",
    "user/vouchers",
    "user",
    "legal/privacy-notice",
    "legal/terms-of-use"
];

export default function useCurrentPage() {
    const router = useRouter();
    const page = pages.find(page => router.pathname.length > 1 && router.pathname.search(page) > -1);

    return page || "home";
}