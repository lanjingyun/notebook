import Header from "./component/head"; 

export default function Layout(props) {
    const { children } = props
    return (
        <>
            <Header />
            <div className="min-h-screan-64 bg-content text-text">
                {children}
            </div>
        </>
    )
}