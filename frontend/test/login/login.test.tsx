import {test} from 'vitest'
import {render} from '@testing-library/react'

import App from '../../src/App'

test('app renders', async () => {
  render(<App />)
})