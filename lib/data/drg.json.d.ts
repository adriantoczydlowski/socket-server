/// <reference types="es6-shim" />
export interface IDRG {
    ms_drg: number;
    fy_2016_final_postacute_drg: string;
    fy_2016_final_special_pay_drg: string;
    mdc: string | number;
    drg_type: string;
    title: string;
    weights: string | number;
    geometric_mean_los: string | number;
    arithmetic_mean_los: string | number;
}
export declare var drgs: Array<IDRG>;
