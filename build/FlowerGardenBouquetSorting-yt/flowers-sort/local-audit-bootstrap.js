// 仅用于独立资源审计，不在正式入口加载。
window.flashist_getLocalizedFilePath=function(x){return x};
const orphanIds=["8874171d-2833-4a53-9751-3b2c340dd986","8dff93f8-9068-49b1-bf7e-ab64c7560509","2981b505-df1c-47ef-9317-fc9337be742a"];let auditPlan;Object.defineProperty(window,"__auditPlan",{get(){return auditPlan},set(plan){auditPlan=plan.map(p=>p.name==="resources"?{...p,uuids:p.uuids.filter(id=>!orphanIds.includes(id))}:p)}});
