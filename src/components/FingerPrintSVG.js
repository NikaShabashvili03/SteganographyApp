
export const FingerprintSVG = ({ paths }) => (
    <svg fill="#000000" height="800px" width="800px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 463 463" xmlSpace="preserve">
        <g>
        {paths.map((path, index) => (
            <path key={index} d={path} />
        ))}
        </g>
    </svg>
)