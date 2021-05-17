module.exports = {
    async rewrites() {
        return [
            {
                source: "/api/:slug*",
                destination: "http://localhost:4000/:slug*",
            },
        ];
    },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({});
