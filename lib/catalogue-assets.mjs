// Existing CPS process illustrations. They never assert a product's appearance.
export const catalogueAssets=[
 {path:'',label:'No image'},
 {path:'/parts-catalogue.png',label:'Parts illustration'},
 {path:'/parts-inspection.png',label:'Inspection illustration'},
 {path:'/knowledge-editorial.png',label:'Identification illustration'},
];
export function validCatalogueAsset(value){return catalogueAssets.some(asset=>asset.path===value);}
