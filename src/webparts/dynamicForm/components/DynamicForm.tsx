import * as React from 'react';
import styles from './DynamicForm.module.scss';
import type { IDynamicFormProps } from './IDynamicFormProps';
import { getSP } from '../../../services/SPService';
import { AdminApp } from './Admin/AdminApp';
import { FormRenderer } from './Renderer/FormRenderer';
import { ListProvisioningService } from '../../../services/ListProvisioningService';

export default class DynamicForm extends React.Component<IDynamicFormProps> {

  public async componentDidMount() {
    // Ensure backend lists exist
    const sp = getSP(this.props.context);
    const provisioning = new ListProvisioningService(sp);
    await provisioning.ensureProvisioning();
  }

  public render(): React.ReactElement<IDynamicFormProps> {
    const sp = getSP(this.props.context);
    const { formId, userDisplayName, context } = this.props;

    return (
      <div className={styles.dynamicForm}>
        {!formId ? (
          <AdminApp sp={sp} currentUserEmail={userDisplayName} />
        ) : (
          <FormRenderer
            sp={sp}
            formId={formId}
            currentUser={context.pageContext.user}
          />
        )}
      </div>
    );
  }
}
