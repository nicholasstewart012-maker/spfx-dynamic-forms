import * as React from 'react';
import { DefaultButton, PrimaryButton, Stack, Separator, IconButton, TextField, Pivot, PivotItem } from '@fluentui/react';
import { IFormDefinition, IQuestion, IRule } from '../../../../models/IFormDefinition';
import { QuestionEditor } from './QuestionEditor';
import { RuleManager } from './RuleManager';
import { v4 as uuidv4 } from 'uuid';

interface IFormDesignerProps {
    form: IFormDefinition;
    onSave: (form: IFormDefinition) => Promise<void>;
    onCancel: () => void;
}

export const FormDesigner: React.FC<IFormDesignerProps> = (props) => {
    const [form, setForm] = React.useState<IFormDefinition>(props.form);
    const [selectedQuestionId, setSelectedQuestionId] = React.useState<string | null>(null);

    // Ensure at least one section exists on mount
    React.useEffect(() => {
        if (!form.sections || form.sections.length === 0) {
            setForm(prev => ({
                ...prev,
                sections: [{ id: uuidv4(), title: 'Page 1', questions: [] }]
            }));
        }
    }, []);

    const handleAddQuestion = (sectionIndex: number) => {
        const newQ: IQuestion = {
            id: uuidv4(),
            title: 'New Question',
            type: 'Text',
            required: false
        };
        const newSections = [...(form.sections || [])];
        newSections[sectionIndex].questions.push(newQ);
        setForm({ ...form, sections: newSections });
        setSelectedQuestionId(newQ.id);
    };

    const handleAddSection = () => {
        setForm(prev => ({
            ...prev,
            sections: [...prev.sections, { id: uuidv4(), title: `Page ${prev.sections.length + 1}`, questions: [] }]
        }));
    };

    const handleUpdateQuestion = (q: IQuestion) => {
        const newSections = form.sections.map(s => ({
            ...s,
            questions: s.questions.map(existing => existing.id === q.id ? q : existing)
        }));
        setForm({ ...form, sections: newSections });
    };

    const handleUpdateRules = (rules: IRule[]) => {
        setForm({ ...form, rules });
    };

    const getSelectedQuestion = () => {
        for (const s of form.sections) {
            const q = s.questions.find(mq => mq.id === selectedQuestionId);
            if (q) return q;
        }
        return null;
    };

    const handleTitleChange = (val: string) => {
        setForm({ ...form, title: val });
    };

    return (
        <Stack tokens={{ childrenGap: 20 }} styles={{ root: { padding: 20 } }}>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                <TextField
                    label="Form Name"
                    value={form.title}
                    onChange={(e, val) => handleTitleChange(val || '')}
                    styles={{ root: { width: 300 } }}
                />
                <Stack horizontal tokens={{ childrenGap: 10 }}>
                    <DefaultButton text="Cancel" onClick={props.onCancel} />
                    <PrimaryButton text="Save Definition" onClick={() => { props.onSave(form).catch((e: any) => console.error(e)); }} iconProps={{ iconName: 'Save' }} />
                </Stack>
            </Stack>
            <Separator />

            <Pivot>
                <PivotItem headerText="Design">
                    <Stack horizontal tokens={{ childrenGap: 20 }} styles={{ root: { marginTop: 20 } }}>
                        {/* Form Canvas (Left) */}
                        <Stack grow styles={{ root: { width: '60%', border: '1px solid #edebe9', padding: 20, backgroundColor: '#faf9f8' } }}>
                            <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: 10 }}>
                                <div style={{ fontSize: 20, fontWeight: 600 }}>Pages</div>
                                <DefaultButton text="Add Page" onClick={handleAddSection} iconProps={{ iconName: 'Add' }} />
                            </Stack>

                            <Stack tokens={{ childrenGap: 20, padding: 10 }}>
                                {form.sections && form.sections.map((section, sIdx) => (
                                    <div key={section.id} style={{ border: '1px dashed #ccc', padding: 10 }}>
                                        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                                            <TextField
                                                value={section.title}
                                                onChange={(e, v) => {
                                                    const newSections = [...form.sections];
                                                    newSections[sIdx].title = v || '';
                                                    setForm({ ...form, sections: newSections });
                                                }}
                                                borderless
                                                styles={{ fieldGroup: { background: 'transparent' }, field: { fontSize: 18, fontWeight: 600, color: '#0078d4' } }}
                                            />
                                            <DefaultButton text="Add Question" onClick={() => handleAddQuestion(sIdx)} iconProps={{ iconName: 'Add' }} />
                                        </Stack>

                                        <Stack tokens={{ childrenGap: 10, padding: 10 }}>
                                            {section.questions.map((q, qIdx) => (
                                                <div
                                                    key={q.id}
                                                    onClick={() => setSelectedQuestionId(q.id)}
                                                    style={{
                                                        padding: 15,
                                                        marginBottom: 10,
                                                        border: selectedQuestionId === q.id ? '2px solid #0078d4' : '1px solid #fff',
                                                        cursor: 'pointer',
                                                        background: '#fff',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    <Stack horizontal horizontalAlign="space-between">
                                                        <div style={{ fontSize: 16, fontWeight: 600 }}><b>{q.title}</b> {q.required ? <span style={{ color: 'red' }}>*</span> : ''}</div>
                                                        <span style={{ fontSize: 12, color: '#666' }}>{q.type}</span>
                                                    </Stack>
                                                    {q.description && <span style={{ fontSize: 12, display: 'block', marginTop: 5 }}>{q.description}</span>}
                                                </div>
                                            ))}
                                            {section.questions.length === 0 && <span style={{ fontStyle: 'italic', color: '#999' }}>No questions.</span>}
                                        </Stack>
                                    </div>
                                ))}
                            </Stack>
                        </Stack>

                        {/* Properties (Right) */}
                        <Stack styles={{ root: { width: '40%', borderLeft: '1px solid #edebe9', paddingLeft: 20 } }}>
                            {selectedQuestionId ? (
                                <QuestionEditor
                                    question={getSelectedQuestion()!}
                                    onChange={handleUpdateQuestion}
                                />
                            ) : (
                                <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { height: 200, color: '#666' } }}>
                                    <div>Select a question to edit properties.</div>
                                </Stack>
                            )}
                        </Stack>
                    </Stack>
                </PivotItem>
                <PivotItem headerText="Logic">
                    <Stack styles={{ root: { padding: 20 } }}>
                        <RuleManager form={form} onChange={handleUpdateRules} />
                    </Stack>
                </PivotItem>
            </Pivot>
        </Stack>
    );
};
