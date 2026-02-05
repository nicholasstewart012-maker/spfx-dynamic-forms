import { SPFI } from "@pnp/sp";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/views";
import "@pnp/sp/fields";
import { IFormDefinition } from "../models/IFormDefinition";

const DEFINITIONS_LIST_TITLE = "FormDefinitions";

export class FormDefinitionService {
    constructor(private _sp: SPFI) { }

    public async getForms(): Promise<IFormDefinition[]> {
        try {
            const items = await this._sp.web.lists.getByTitle(DEFINITIONS_LIST_TITLE).items
                .select("Id", "FormId", "Title", "Status", "Version", "Description", "SchemaJson", "Author/Title", "Modified")
                .expand("Author")();

            return items.map(item => this.mapItemToDefinition(item));
        } catch (e) {
            console.error("Error fetching forms", e);
            return [];
        }
    }

    public async getFormById(formId: string): Promise<IFormDefinition | undefined> {
        try {
            const items = await this._sp.web.lists.getByTitle(DEFINITIONS_LIST_TITLE).items
                .filter(`FormId eq '${formId}'`)
                .select("Id", "FormId", "Title", "Status", "Version", "Description", "SchemaJson", "Author/Title", "Modified")
                .expand("Author")
                .top(1)();

            if (items.length === 0) return undefined;
            return this.mapItemToDefinition(items[0]);
        } catch (e) {
            console.error("Error fetching form by id", e);
            return undefined;
        }
    }

    public async saveForm(definition: IFormDefinition): Promise<string> {
        const list = this._sp.web.lists.getByTitle(DEFINITIONS_LIST_TITLE);

        // Ensure target submission list exists name logic
        const safeTitle = definition.title.replace(/[^a-zA-Z0-9]/g, "");
        const targetList = `FormSubmissions_${safeTitle}`;

        const payload = {
            Title: definition.title,
            FormId: definition.id,
            Description: definition.description,
            Status: "Draft", // Always save as Draft effectively, Publish separate action or flag
            Version: definition.version,
            SchemaJson: JSON.stringify(definition),
            TargetSubmissionsList: targetList
        };

        const items = await list.items.filter(`FormId eq '${definition.id}'`).select("Id")();

        if (items.length > 0) {
            await list.items.getById(items[0].Id).update(payload);
        } else {
            await list.items.add(payload);
        }

        // Provision the submission list if it doesn't exist
        await this.ensureSubmissionList(targetList);

        return definition.id;
    }

    private async ensureSubmissionList(listTitle: string): Promise<void> {
        try {
            // Check if list exists, will throw if not found
            await this._sp.web.lists.getByTitle(listTitle)();
        } catch (e) {
            // List doesn't exist, create it
            await this._sp.web.lists.add(listTitle, `Submissions for ${listTitle}`, 100, true);
            const list = this._sp.web.lists.getByTitle(listTitle);

            // Add required fields
            await list.fields.addText("FormId");
            await list.fields.addMultilineText("ResponseJson");
            await list.fields.addDateTime("SubmittedAt");

            // Add to view
            const view = list.views.getByTitle("All Items");
            await view.fields.add("FormId");
            await view.fields.add("ResponseJson");
            await view.fields.add("SubmittedAt");
            await view.fields.add("Created");
        }
    }

    public async publishForm(formId: string): Promise<void> {
        const list = this._sp.web.lists.getByTitle(DEFINITIONS_LIST_TITLE);
        const items = await list.items.filter(`FormId eq '${formId}'`).select("Id")();
        if (items.length > 0) {
            await list.items.getById(items[0].Id).update({ Status: "Published" });
        }
    }

    public async deleteForm(formId: string): Promise<void> {
        const list = this._sp.web.lists.getByTitle(DEFINITIONS_LIST_TITLE);
        const items = await list.items.filter(`FormId eq '${formId}'`).select("Id")();
        if (items.length > 0) {
            await list.items.getById(items[0].Id).delete();
        }
    }

    private mapItemToDefinition(item: any): IFormDefinition {
        let def: IFormDefinition;
        try {
            def = JSON.parse(item.SchemaJson);
        } catch (e) {
            def = {
                id: item.FormId,
                title: item.Title,
                description: item.Description,
                sections: [],
                rules: [],
                version: item.Version,
                created: "",
                modified: "",
                author: ""
            };
        }
        // Override with metadata to ensure sync
        def.id = item.FormId;
        def.title = item.Title;
        def.version = item.Version;
        if (item.Author) def.author = item.Author.Title;
        def.modified = item.Modified;
        return def;
    }
}
