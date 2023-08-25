import { ReactElement, useEffect, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Data, mapSetup } from "./data";
import SearchBox from "./components/SearchBox";
import Spinner from "./components/Spinner";
import zoomInIcon from "@assets/zoomIn.svg";
import zoomOutIcon from "@assets/zoomOut.svg";
import fullZoomOutIcon from "@assets/fullZoomOut.svg";
import Map from "@assets/map.svg";
import InfoButton from "./components/InfoButton";
import DownlaodButton from "./components/DownlaodButton";

function App() {
  console.log(Map);
  const overlayElementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Data | undefined>(undefined);

  const setup = async () => {
    if (containerRef.current === null)
      throw Error("container ref is null while trying to run setup");
    await mapSetup(containerRef).then((_data) => setData(_data));
  };

  const [loading, setLoading] = useState(true);

  const fetched = useRef(false);
  useEffect(() => {
    if (!fetched.current) {
      fetched.current = true;
      fetch(Map)
        .then((res) => res.text())
        .then((svg) => {
          if (containerRef.current === null)
            throw Error("map container ref is null");
          containerRef.current.innerHTML = svg;

          // add full height and width to new svg element
          document
            .querySelector("div > svg")
            ?.classList.add("w-full", "h-full");

          setLoading(false);

          setup();
        });
    }
  }, []);

  return (
    <>
      <div className="absolute w-screen h-screen">
        {loading && (
          <Spinner className="absolute h-20 w-20 bottom-[calc(50%-5rem/2)] left-[calc(50%-5rem/2)] transition-all duration-500" />
        )}
        <InfoButton />
        <DownlaodButton />
        <TransformWrapper centerOnInit centerZoomedOut={false} smooth={false}>
          {({
            zoomIn,
            zoomOut,
            resetTransform,
            zoomToElement,
            setTransform,
            instance,
          }) => (
            <>
              {data === undefined ? (
                <Spinner className="fixed h-10 w-10 bottom-5 right-5" />
              ) : (
                <SearchBox
                  zoomToElement={(element: HTMLElement) =>
                    zoomToElement(
                      element,
                      window.innerWidth < 800 ? 3 : 2,
                      500,
                      "easeInQuad"
                    )
                  }
                  zoomIn={() => zoomIn()}
                  zoomOut={() => zoomOut()}
                  move={(direction) => {
                    let x = 0,
                      y = 0;
                    const d = 80;
                    switch (direction) {
                      case "right":
                        x = -d;
                        break;
                      case "left":
                        x = d;
                        break;
                      case "up":
                        y = d;
                        break;
                      case "down":
                        y = -d;
                        break;
                      default:
                        break;
                    }
                    const current = instance.transformState;
                    setTransform(
                      current.positionX + x,
                      current.positionY + y,
                      current.scale,
                      100,
                      "easeOutCubic"
                    );
                  }}
                  overlayRef={overlayElementRef}
                  data={data}
                />
              )}
              <div className="fixed bottom-3 left-3 z-10 flex flex-col gap-2">
                <ControlButton onClick={() => zoomIn()}>
                  <img
                    className="invert h-2/3"
                    src={zoomInIcon}
                    alt="zoom in"
                  />
                </ControlButton>
                <ControlButton onClick={() => zoomOut()}>
                  <img
                    className="invert h-2/3"
                    src={zoomOutIcon}
                    alt="zoom out"
                  />
                </ControlButton>
                <ControlButton onClick={() => resetTransform()}>
                  <img
                    className="invert h-2/3"
                    src={fullZoomOutIcon}
                    alt="full zoom out"
                  />
                </ControlButton>
              </div>

              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="!w-full !h-full relative"
              >
                <div
                  className="h-full w-full flex justify-center items-center"
                  ref={containerRef}
                />
                <div className="absolute top-0 left-0 pointer-events-none h-full w-full">
                  <div
                    className="h-full w-full relative"
                    ref={overlayElementRef}
                  />
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </>
  );
}

function ControlButton({
  children,
  onClick,
}: {
  children: ReactElement | string;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded-full cursor-pointer aspect-square bg-zinc-800 h-10 text-white flex justify-center items-center"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default App;
