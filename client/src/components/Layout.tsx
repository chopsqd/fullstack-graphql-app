import React from 'react';
import Wrapper, {WrapperVariantType} from "./Wrapper";
import NavBar from "./NavBar";

interface ILayoutProps {
    children: React.ReactNode
    variant?: WrapperVariantType
}

const Layout: React.FC<ILayoutProps> = ({children, variant}) => {
    return (
        <>
            <NavBar/>
            <Wrapper variant={variant}>
                {children}
            </Wrapper>
        </>
    );
};

export default Layout;
