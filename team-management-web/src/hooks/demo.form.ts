import { createFormHook } from '@tanstack/react-form'

import {
    PasswordField,
  Select,
  SubscribeButton,
  TextArea,
  TextField,
} from '../components/FormComponents'
import { fieldContext, formContext } from './demo.form-context'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    Select,
    TextArea,
    PasswordField,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
