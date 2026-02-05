import { SPFI } from "@pnp/sp";
import { Web } from "@pnp/sp/webs";
import { AssignFrom } from "@pnp/core";
import "@pnp/sp/files";
import * as XLSX from "xlsx";

export class ExcelAutoFillService {
    constructor(private sp: SPFI) { }

    public async getExcelData(fileRelativePath: string, sheetName?: string, siteUrl?: string): Promise<any[]> {
        try {
            let fileProxy;

            if (siteUrl) {
                // Use AssignFrom to copy behaviors (auth) from the current web instance
                const web = Web(siteUrl).using(AssignFrom(this.sp.web));
                fileProxy = web.getFileByServerRelativePath(fileRelativePath);
            } else {
                fileProxy = this.sp.web.getFileByServerRelativePath(fileRelativePath);
            }

            const buffer = await fileProxy.getBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const targetSheetName = sheetName || workbook.SheetNames[0];
            const sheet = workbook.Sheets[targetSheetName];

            if (!sheet) {
                console.warn(`Sheet ${targetSheetName} not found in ${fileRelativePath}`);
                return [];
            }

            return XLSX.utils.sheet_to_json(sheet);
        } catch (e) {
            console.error(`Error reading Excel file ${fileRelativePath} from ${siteUrl || 'current site'}`, e);
            return [];
        }
    }
}
