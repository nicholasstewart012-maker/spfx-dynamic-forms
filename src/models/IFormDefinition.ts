export type QuestionType = 'Text' | 'Note' | 'Choice' | 'Dropdown' | 'Date' | 'Number' | 'People' | 'YesNo' | 'Attachment' | 'Rating';

export interface IAutoFillConfig {
  enabled: boolean;
  excelFilePath?: string;
  excelSiteUrl?: string; // Optional: Full URL or Relative URL to the site where the file lives
  sheetName?: string;
  keyColumn?: string;
  mappings: Record<string, string>; // Excel Column Name -> Target Question ID
}

export interface IQuestion {
  id: string;
  title: string;
  type: QuestionType;
  required: boolean;
  description?: string;
  choices?: string[]; // For Choice/Dropdown
  autoFill?: IAutoFillConfig;
}

export interface ISection {
  id: string;
  title: string;
  description?: string;
  questions: IQuestion[];
}

export interface IRule {
  id: string;
  sourceQuestionId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
  targetQuestionId: string;
  action: 'Show' | 'Hide';
}

export interface IFormDefinition {
  id: string;
  title: string;
  description?: string;
  sections: ISection[];
  rules: IRule[];
  version: number;
  created: string;
  modified: string;
  author: string;
}

export interface IFormSubmission {
  id: string; // SharePoint ID
  formId: string;
  responses: Record<string, any>; // QuestionID -> Value
  submittedBy: string;
  submittedAt: string;
}
