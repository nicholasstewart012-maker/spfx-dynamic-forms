import * as React from 'react';
import { Stack, TextField, IconButton, Toggle, Dropdown, IDropdownOption } from '@fluentui/react';
import { IQuestion } from '../../../../models/IFormDefinition';
import { useFormContext } from './FormContext';
import styles from './Card.module.scss';

interface IQuestionCardProps {
    question: IQuestion;
    index: number;
}

const QUESTION_TYPES: IDropdownOption[] = [
    { key: 'Text', text: 'Text', data: { icon: 'TextField' } },
    { key: 'Choice', text: 'Choice', data: { icon: 'RadioBtnOn' } },
    { key: 'Date', text: 'Date', data: { icon: 'Calendar' } },
    { key: 'Rating', text: 'Rating', data: { icon: 'FavoriteStar' } } // Future
];

export const QuestionCard: React.FC<IQuestionCardProps> = ({ question, index }) => {
    const { state, dispatch } = useFormContext();
    const isSelected = state.selectedQuestionId === question.id;

    const handleSelect = (e: any) => {
        e.stopPropagation();
        if (!isSelected) {
            dispatch({ type: 'SELECT_QUESTION', payload: question.id });
        }
    };

    const handleDelete = (e: any) => {
        e.stopPropagation();
        dispatch({ type: 'DELETE_QUESTION', payload: question.id });
    };

    const handleChange = (field: keyof IQuestion, value: any) => {
        dispatch({ type: 'UPDATE_QUESTION', payload: { ...question, [field]: value } });
    };

    if (!isSelected) {
        // --- View Mode ---
        return (
            <div className={styles.card} onClick={handleSelect}>
                <div className={styles.cardContent}>
                    <Stack tokens={{ childrenGap: 8 }}>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>
                            {index + 1}. {question.title}
                            {question.required && <span style={{ color: '#a4262c', marginLeft: 4 }}>*</span>}
                        </div>
                        {question.type === 'Text' && (
                            <TextField disabled placeholder="Enter your answer" />
                        )}
                        {question.type === 'Choice' && (
                            <Stack tokens={{ childrenGap: 8 }}>
                                {question.choices?.map((c, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid #666' }} />
                                        <span>{c}</span>
                                    </div>
                                )) || <div style={{ color: '#666', fontStyle: 'italic' }}>No options defined</div>}
                            </Stack>
                        )}
                    </Stack>
                </div>
            </div>
        );
    }

    // --- Edit Mode ---
    return (
        <div className={`${styles.card} ${styles.cardSelected}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cardContent}>
                <Stack tokens={{ childrenGap: 15 }}>
                    <Stack horizontal tokens={{ childrenGap: 10 }}>
                        <div style={{ paddingTop: 8, fontWeight: 600 }}>{index + 1}.</div>
                        <input
                            className={styles.titleInput}
                            value={question.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Question Title"
                            autoFocus
                        />
                        {/* Type Selector (Simplified) */}
                        <Dropdown
                            selectedKey={question.type}
                            options={QUESTION_TYPES}
                            onChange={(e, o) => handleChange('type', o?.key as any)}
                            styles={{ root: { width: 150 } }}
                        />
                    </Stack>

                    <input
                        className={styles.descriptionInput}
                        value={question.description || ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Description (optional)"
                    />

                    {/* Type Specific Editors */}
                    {question.type === 'Choice' && (
                        <Stack tokens={{ childrenGap: 8 }}>
                            {(question.choices || []).map((c, i) => (
                                <Stack horizontal key={i} tokens={{ childrenGap: 8 }} verticalAlign="center">
                                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid #ccc' }} />
                                    <TextField
                                        value={c}
                                        onChange={(e, v) => {
                                            const newChoices = [...(question.choices || [])];
                                            newChoices[i] = v || '';
                                            handleChange('choices', newChoices);
                                        }}
                                        styles={{ root: { width: '100%' }, fieldGroup: { border: 'none', borderBottom: '1px solid #edebe9' } }}
                                    />
                                    <IconButton iconProps={{ iconName: 'Delete' }} onClick={() => {
                                        const newChoices = question.choices?.filter((_, idx) => idx !== i);
                                        handleChange('choices', newChoices);
                                    }} />
                                </Stack>
                            ))}
                            <div
                                style={{ padding: '8px 0', cursor: 'pointer', color: '#0078d4', display: 'flex', alignItems: 'center', gap: 8 }}
                                onClick={() => handleChange('choices', [...(question.choices || []), `Option ${(question.choices?.length || 0) + 1}`])}
                            >
                                <IconButton iconProps={{ iconName: 'Add' }} styles={{ root: { height: 20 } }} /> Add Option
                            </div>
                        </Stack>
                    )}

                </Stack>
            </div>
            <div className={styles.cardActions}>
                <Toggle
                    label="Required"
                    checked={question.required}
                    onChange={(e, v) => handleChange('required', !!v)}
                    inlineLabel
                />
                <IconButton
                    iconProps={{ iconName: 'Delete' }}
                    title="Delete Question"
                    onClick={handleDelete}
                    styles={{ root: { color: '#a4262c' } }}
                />
            </div>
        </div>
    );
};
