/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        unoptimized: true
    },
    webpack: (config, {isServer}) => {
        if (!isServer) {
            config.target = 'web';
            config.node = {
                __dirname: true,
            };
        }
        config.output.globalObject = 'this';
        return config;
    },
}

module.exports = nextConfig
