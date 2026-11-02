const urlParams = new URLSearchParams(window.__ytOriginalQuery || window.location.search);
const flashist_parentAppGlobalVars = JSON.parse(urlParams.get('parentAppGlobalVars'));

// interface IParentAppGlobalVars {
//     language?: string;
//     userName?: string;
//     deviceType?: string;
// }

const DeviceType = {
    MOBILE: "mobile",
    DESKTOP: "desktop"
};