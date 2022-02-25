import { useMemo } from "react";
import { createTheme, StyledEngineProvider } from "@mui/material/styles";
import { ThemeProvider } from "@mui/system";
import { CssBaseline } from "@mui/material";

const DEFAULT_VALUES = {
    palette: {
        primary: { light: "#edf5fd", main: "#1976d2"},
        text: { primary: "#212B36", secondary: "#637381", disabled: "#919EAB" },
        background: { default: "#fff"},
    }
};

export const StoreThemeConfig = ({ customTheme, children }) => {
    customTheme = Object.keys(customTheme).length === 0 ? null : customTheme;
    console.log(customTheme);
    const themeOptions = useMemo(
        () => (customTheme ?? DEFAULT_VALUES),
        []
    );

    const theme = createTheme(themeOptions);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </StyledEngineProvider>
    );
};
