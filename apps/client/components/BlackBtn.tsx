interface BlackBtnProps {
    text: string;
}

export const BlackBtn = ({text}: BlackBtnProps) => {
    return (
        <>
        <button className="bg-black text-white rounded-lg p-2 px-10 border text-sm font-bold">{text}</button>
        </>
    );
}