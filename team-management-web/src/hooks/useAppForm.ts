import { createFormHook } from '@tanstack/react-form'

import {
    PasswordField,
    PhoneField,
    Select,
    SubscribeButton,
    TextArea,
    TextField,
} from '../components/FormComponents'
import { fieldContext, formContext } from './form-context'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    Select,
    TextArea,
    PasswordField,
    PhoneField,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
