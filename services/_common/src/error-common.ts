
/////////////////////
// Export the common error as individual constant for expressiveness
// Note: here we do not export a symbolDic of all of those, to allow the service code
//       to only import what they need. The import auto reformating system will how only what is used for a given module. 
////


export const INVALID_INPUT = Symbol('INVALID_INPUT')
export const APP_ERROR = Symbol('APP_ERROR');
export const CODE_ERROR = Symbol('CODE_ERROR');
export const HTTP_404 = Symbol('HTTP_404');
