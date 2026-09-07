const { MonitorType } = require("./monitor-type");
const { UP } = require("../../src/util");

class WebsiteDefacementMonitorType extends MonitorType {

    name = "website-defacement";

    async check(monitor, heartbeat, server) {

        const startTime = Date.now();

        // Validate target URL
        const targetUrl = new URL(monitor.url);

        if (
            targetUrl.protocol !== "http:" &&
            targetUrl.protocol !== "https:"
        ) {
            throw new Error(
                "Invalid target URL. Only HTTP and HTTPS are allowed."
            );
        }

        const response = await fetch(
            "http://website-deface-monitor:8000/scan",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    url: monitor.url,
                    site_type: "static"
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                `Defacement API returned HTTP ${response.status}`
            );
        }

        const data = await response.json();

        if (!data.analysis) {
            throw new Error(
                "Invalid response from defacement API: analysis missing"
            );
        }

        const analysis = data.analysis;

        const confidence = analysis.confidence_percent ?? 0;
        const verdict = analysis.verdict ?? "UNKNOWN";

        const elapsed = Date.now() - startTime;

        heartbeat.ping = elapsed;

        if (analysis.likely_defaced === true) {

            throw new Error(
                `Possible website defacement | Verdict: ${verdict} | Confidence: ${confidence}%`
            );

        }

        heartbeat.status = UP;

        heartbeat.msg =
            `Website integrity OK | Verdict: ${verdict} | Confidence: ${confidence}%`;
    }
}

module.exports = {
    WebsiteDefacementMonitorType,
};
