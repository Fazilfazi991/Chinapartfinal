'use client';
import {createContext,useContext} from 'react';
export const WorkspaceEnvironment=createContext<{live:boolean;mode:'staff'|'customer';writes:boolean;publication:boolean;documents:string[];photos:boolean}>({live:false,mode:'customer',writes:true,publication:false,documents:[],photos:false});
export const useWorkspaceEnvironment=()=>useContext(WorkspaceEnvironment);
