import * as React from 'react';
import { Stack, DefaultButton, PrimaryButton } from '@fluentui/react';
import { IFormDefinition } from '../../../../models/IFormDefinition';
import { FormProvider, useFormContext } from './FormContext';
import { QuestionCard } from './QuestionCard';
import styles from './Card.module.scss';
import type { SPFI } from '@pnp/sp';

interface IFormDesignerV2Props {
    form: IFormDefinition;
    sp: SPFI;
    onSave: (form: IFormDefinition) => Promise<void>;
    onCancel: () => void;
}

const DesignerCanvas: React.FC<{ onSave: (f: IFormDefinition) => Promise<void>, onCancel: () => void }> = ({ onSave, onCancel }) => {
    const { state, dispatch } = useFormContext();
    const { form } = state;

    const handleAddQuestion = (e: any, type: string) => {
        e.stopPropagation();
        dispatch({ type: 'ADD_QUESTION', payload: { type } });
    };

    return (
        <div className={styles.canvas} onClick={() => dispatch({ type: 'SELECT_QUESTION', payload: null })}>
            {/* Header / Actions */}
            <Stack horizontal horizontalAlign="space-between" styles={{ root: { width: '100%', maxWidth: 720, marginBottom: 20 } }}>
                <DefaultButton text="Back" onClick={onCancel} />
                <Stack horizontal tokens={{ childrenGap: 10 }}>
                    <PrimaryButton text="Preview" iconProps={{ iconName: 'View' }} />
                    <PrimaryButton text="Save" onClick={() => { onSave(form).catch(console.error); }} />
                </Stack>
            </Stack>

            {/* Title Card */}
            <div className={`${styles.card} ${styles.cardSelected}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.cardHeader} style={{ borderTop: '4px solid #0078d4', borderRadius: '8px 8px 0 0' }}>
                    <input
                        className={styles.titleInput}
                        style={{ fontSize: 32 }}
                        value={form.title}
                        onChange={(e) => dispatch({ type: 'UPDATE_TITLE', payload: { title: e.target.value, description: form.description } })}
                        placeholder="Untitled Form"
                    />
                    <input
                        className={styles.descriptionInput}
                        value={form.description || ''}
                        onChange={(e) => dispatch({ type: 'UPDATE_TITLE', payload: { title: form.title, description: e.target.value } })}
                        placeholder="Form description"
                    />
                </div>
            </div>

            {/* Questions */}
            {form.sections && form.sections.length > 0 && form.sections[0].questions.map((q, i) => (
                <QuestionCard key={q.id} question={q} index={i} />
            ))}

            {/* Add New Button */}

            {/* Add New Button */}
            <div className={styles.card} style={{ padding: 15, display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
                <Stack horizontal tokens={{ childrenGap: 10 }}>
                    <DefaultButton text="Choice" iconProps={{ iconName: 'RadioBtnOn' }} onClick={(e) => handleAddQuestion(e, 'Choice')} />
                    <DefaultButton text="Text" iconProps={{ iconName: 'TextField' }} onClick={(e) => handleAddQuestion(e, 'Text')} />
                    <DefaultButton text="Rating" iconProps={{ iconName: 'FavoriteStar' }} disabled />
                    <DefaultButton text="Date" iconProps={{ iconName: 'Calendar' }} onClick={(e) => handleAddQuestion(e, 'Date')} />
                </Stack>
            </div>
        </div>
    );
};

export const FormDesignerV2: React.FC<IFormDesignerV2Props> = (props) => {
    return (
        <FormProvider>
            <FormInitializer form={props.form} />
            <DesignerCanvas onSave={props.onSave} onCancel={props.onCancel} />
        </FormProvider>
    );
};

// Start context with props
const FormInitializer: React.FC<{ form: IFormDefinition }> = ({ form }) => {
    const { dispatch } = useFormContext();
    React.useEffect(() => {
        dispatch({ type: 'INIT_FORM', payload: form });
    }, [form]);
    return null;
};
