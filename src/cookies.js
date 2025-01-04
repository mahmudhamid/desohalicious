const tenantID = typeof document != "undefined" && document?.cookie?.split("; ")?.find(row => row?.startsWith("ti"))?.split('=')[1] || "d4e1b66e-d588-4752-8998-ffede42aa5f8";

export {
    tenantID
}