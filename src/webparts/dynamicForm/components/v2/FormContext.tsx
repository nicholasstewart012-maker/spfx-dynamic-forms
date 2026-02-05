import * as React from 'react';
import { IFormDefinition, IQuestion } from '../../../../models/IFormDefinition';
import { v4 as uuidv4 } from 'uuid';

// --- Types ---
export interface IFormState {
    form: IFormDefinition;
    selectedQuestionId: string | null;
    isSaving: boolean;
    lastSaved: Date | null;
}

export type FormAction =
    | { type: 'INIT_FORM'; payload: IFormDefinition }
    | { type: 'UPDATE_TITLE'; payload: { title: string; description?: string } }
    | { type: 'ADD_QUESTION'; payload: { type: string; index?: number } }
    | { type: 'UPDATE_QUESTION'; payload: IQuestion }
    | { type: 'DELETE_QUESTION'; payload: string }
    | { type: 'SELECT_QUESTION'; payload: string | null }
    | { type: 'SET_SAVING'; payload: boolean }
    | { type: 'SET_SAVED'; payload: Date };

// --- Initial State ---
const initialState: IFormState = {
    form: {
        id: '',
        title: 'Untitled Form',
        sections: [],
        rules: [],
        version: 1,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        author: ''
    },
    selectedQuestionId: null,
    isSaving: false,
    lastSaved: null
};

// --- Reducer ---
const formReducer = (state: IFormState, action: FormAction): IFormState => {
    switch (action.type) {
        case 'INIT_FORM':
            return { ...state, form: action.payload };

        case 'UPDATE_TITLE':
            return {
                ...state,
                form: {
                    ...state.form,
                    title: action.payload.title,
                    description: action.payload.description
                }
            };

        case 'ADD_QUESTION': {
            const newQ: IQuestion = {
                id: uuidv4(),
                title: 'Question',
                type: action.payload.type as any,
                required: false
            };

            // Logic: Add to first section for MVP v2, or currently selected section
            // For now, assume single page/section for v2 MVP to match MS Forms simple view first
            const sections = [...(state.form.sections || [])];
            if (sections.length === 0) sections.push({ id: uuidv4(), title: 'Section 1', questions: [] });

            sections[0].questions.push(newQ);

            return {
                ...state,
                form: { ...state.form, sections },
                selectedQuestionId: newQ.id
            };
        }

        case 'UPDATE_QUESTION': {
            const sections = state.form.sections.map(s => ({
                ...s,
                questions: s.questions.map(q => q.id === action.payload.id ? action.payload : q)
            }));
            return {
                ...state,
                form: { ...state.form, sections }
            };
        }

        case 'DELETE_QUESTION': {
            const sections = state.form.sections.map(s => ({
                ...s,
                questions: s.questions.filter(q => q.id !== action.payload)
            }));
            return {
                ...state,
                form: { ...state.form, sections },
                selectedQuestionId: null // Deselect
            };
        }

        case 'SELECT_QUESTION':
            return { ...state, selectedQuestionId: action.payload };

        case 'SET_SAVING':
            return { ...state, isSaving: action.payload };

        case 'SET_SAVED':
            return { ...state, isSaving: false, lastSaved: action.payload };

        default:
            return state;
    }
};

// --- Context ---
interface IFormContextProps {
    state: IFormState;
    dispatch: React.Dispatch<FormAction>;
}

export const FormContext = React.createContext<IFormContextProps>({
    state: initialState,
    dispatch: () => null
});

// --- Provider ---
export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = React.useReducer(formReducer, initialState);

    return (
        <FormContext.Provider value={{ state, dispatch }}>
            {children}
        </FormContext.Provider>
    );
};

// --- Hook ---
export const useFormContext = () => React.useContext(FormContext);
