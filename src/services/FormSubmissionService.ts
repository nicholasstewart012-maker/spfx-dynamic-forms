import { SPFI } from "@pnp/sp";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import { IFormSubmission } from "../models/IFormDefinition";

export class FormSubmissionService {
    constructor(private sp: SPFI) { }

    public async submitResponse(formTitle: string, submission: IFormSubmission): Promise<string> {
        const safeTitle = formTitle.replace(/[^a-zA-Z0-9]/g, "");
        const listTitle = `FormSubmissions_${safeTitle}`;

        const payload: any = {
            Title: `Response - ${submission.submittedBy} - ${new Date().toLocaleString()}`,
            FormId: submission.formId,
            ResponseJson: JSON.stringify(submission.responses),
            SubmittedAt: new Date().toISOString()
        };

        try {
            const result = await this.sp.web.lists.getByTitle(listTitle).items.add(payload);
            return result.data.Id;
        } catch (e) {
            console.error(`Error submitting to ${listTitle}`, e);
            throw e;
        }
    }
}
