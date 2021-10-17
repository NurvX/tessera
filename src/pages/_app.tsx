import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '../style/Global.scss';
import {StepperContainer} from "../components/StepperContainer";
import {useState} from "react";
import {useRouter} from "next/router";
import {AnimatePresence} from "framer-motion";
import {Provider} from "react-redux";
import {store} from "../store/store";

export default function Global({ Component, pageProps }) {
    const router = useRouter();
    const [direction, setDirection] = useState<number>(0);

    return (
        <Provider store={store}>
            <StepperContainer onBack={() => setDirection(-1)} onNext={() => setDirection(1)} disableOverflow={pageProps.disableOverflow ?? false} noNext={pageProps.noNext ?? false}>
                <AnimatePresence exitBeforeEnter initial={false}>
                    <Component {...pageProps} key={router.pathname} direction={direction} />
                </AnimatePresence>
            </StepperContainer>
        </Provider>
    );
}
