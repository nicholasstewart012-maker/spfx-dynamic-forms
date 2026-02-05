import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields";

const DEFINITIONS_LIST_TITLE = "FormDefinitions";

export class ListProvisioningService {
    private _sp: SPFI;

    constructor(sp: SPFI) {
        this._sp = sp;
    }

    public async ensureProvisioning(): Promise<void> {
        await this.ensureDefinitionsList();
    }

    public async ensureSubmissionsList(formTitle: string): Promise<string> {
        const listTitle = `FormSubmissions_${formTitle.replace(/[^a-zA-Z0-9]/g, "")}`;
        const ensureResult = await this._sp.web.lists.ensure(listTitle, `Submissions for ${formTitle}`);

        if (ensureResult.created) {
            const list = ensureResult.list;
            await list.fields.addText("FormId", { Required: true, Indexed: true });
            await list.fields.addMultilineText("ResponseJson");
            await list.fields.addDateTime("SubmittedAt");
            // SubmittedBy is usually 'Author' (Created By), but we might want a specific field if anon users allowed (not likely in SPFx)
        }
        return listTitle;
    }

    private async ensureDefinitionsList(): Promise<void> {
        const ensureResult = await this._sp.web.lists.ensure(DEFINITIONS_LIST_TITLE, "Stores form schemas");
        if (ensureResult.created) {
            const list = ensureResult.list;
            // Field creation
            await list.fields.addText("FormId", { Required: true, Indexed: true });
            await list.fields.addMultilineText("Description", { NumberOfLines: 3 });
            await list.fields.addChoice("Status", { Choices: ["Draft", "Published"] });
            await list.fields.addNumber("Version");
            await list.fields.addMultilineText("SchemaJson", { NumberOfLines: 6 });
            await list.fields.addText("TargetSubmissionsList");
        }
    }
}
