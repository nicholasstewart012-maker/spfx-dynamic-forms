import * as React from 'react';
import { TextField, Dropdown, Toggle, IDropdownOption } from '@fluentui/react';
import { IQuestion, QuestionType } from '../../../../models/IFormDefinition';

interface IQuestionEditorProps {
    question: IQuestion;
    onChange: (updatedQuestion: IQuestion) => void;
}

const QUESTION_TYPES: IDropdownOption[] = [
    { key: 'Text', text: 'Single Line Text' },
    { key: 'Note', text: 'Multi-line Text' },
    { key: 'Choice', text: 'Choice (Radio)' },
    { key: 'Dropdown', text: 'Dropdown' },
    { key: 'Date', text: 'Date' },
    { key: 'Number', text: 'Number' },
    { key: 'People', text: 'People Picker' },
    { key: 'YesNo', text: 'Yes/No' },
];

export const QuestionEditor: React.FC<IQuestionEditorProps> = (props) => {
    const { question, onChange } = props;

    const handleFieldChange = (field: keyof IQuestion, value: any) => {
        onChange({ ...question, [field]: value });
    };

    const handleChoiceChange = (val: string) => {
        // Split by newline
        const choices = val.split('\n').filter(c => c.trim() !== '');
        onChange({ ...question, choices });
    };

    return (
        <div className="ms-Grid" dir="ltr">
            <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12">
                    <TextField
                        label="Question Title"
                        value={question.title}
                        onChange={(e, val) => handleFieldChange('title', val)}
                    />
                    <TextField
                        label="Description (Help Text)"
                        value={question.description || ''}
                        onChange={(e, val) => handleFieldChange('description', val)}
                        multiline rows={2}
                    />
                    <Dropdown
                        label="Question Type"
                        selectedKey={question.type}
                        options={QUESTION_TYPES}
                        onChange={(e, opt) => handleFieldChange('type', opt ? opt.key as QuestionType : 'Text')}
                    />
                    <Toggle
                        label="Required"
                        checked={question.required}
                        onChange={(e, val) => handleFieldChange('required', val)}
                    />

                    {(question.type === 'Choice' || question.type === 'Dropdown') && (
                        <TextField
                            label="Options (one per line)"
                            multiline
                            rows={5}
                            value={question.choices?.join('\n') || ''}
                            onChange={(e, val) => handleChoiceChange(val || '')}
                        />
                    )}

                    <Toggle
                        label="Enable Excel Auto-Fill"
                        checked={question.autoFill?.enabled || false}
                        onChange={(e, checked) => {
                            if (checked) {
                                onChange({
                                    ...question,
                                    autoFill: { enabled: true, mappings: {} }
                                });
                            } else {
                                onChange({ ...question, autoFill: undefined });
                            }
                        }}
                    />

                    {question.autoFill && (
                        <div style={{ padding: 10, border: '1px dashed #ccc', marginTop: 10 }}>
                            <TextField
                                label="Excel File Path (Server Relative)"
                                value={question.autoFill.excelFilePath || ''}
                                onChange={(e, v) => onChange({ ...question, autoFill: { ...question.autoFill!, excelFilePath: v } })}
                                placeholder="/sites/SiteA/DocLib/File.xlsx"
                            />
                            <TextField
                                label="Excel Site URL (Optional, for cross-site)"
                                value={question.autoFill.excelSiteUrl || ''}
                                onChange={(e, v) => onChange({ ...question, autoFill: { ...question.autoFill!, excelSiteUrl: v } })}
                                placeholder="https://tenant.sharepoint.com/sites/SiteA"
                            />
                            <TextField
                                label="Sheet Name (Optional)"
                                value={question.autoFill.sheetName || ''}
                                onChange={(e, v) => onChange({ ...question, autoFill: { ...question.autoFill!, sheetName: v } })}
                            />
                            <TextField
                                label="Lookup Key Column (in Excel)"
                                value={question.autoFill.keyColumn || ''}
                                onChange={(e, v) => onChange({ ...question, autoFill: { ...question.autoFill!, keyColumn: v } })}
                                description="The column in Excel to match against THIS question's answer."
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
