import type {PreviewSnapshot} from './preview-domain.mjs';
export function normalizeWorkspaceSnapshot(snapshot:{identity:any;resources:Record<string,any[]>;paging?:Record<string,any>},readiness?:{writes?:boolean;publication?:boolean;linking?:boolean;documents?:unknown}):PreviewSnapshot;
