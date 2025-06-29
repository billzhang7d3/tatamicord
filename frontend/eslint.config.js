import mantine from "eslint-config-mantine"
import tseslint from "typescript-eslint"
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
    ...mantine,
    { ignores: ["**/*.{mjs,cjs,js,d.ts,d.mts}", "./.storybook/main.ts"] },
    {
        files: ["**/*.story.tsx"],
        rules: { "no-console": "off" },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
    },
)