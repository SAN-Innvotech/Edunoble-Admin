import gsap from "gsap";

import React, { useEffect } from "react";

export default function AuthImageMove() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  useEffect(() => {
    const parallaxIt = () => {
      const target = document.querySelectorAll(".js-mouse-move-container");

      target.forEach((container) => {
        const targets = container.querySelectorAll(".js-mouse-move");

        targets.forEach((el) => {
          const movement = el.getAttribute("data-move");

          document.addEventListener("mousemove", (e) => {
            const relX = e.pageX - container.offsetLeft;
            const relY = e.pageY - container.offsetTop;

            gsap.to(el, {
              x:
                ((relX - container.offsetWidth / 2) / container.offsetWidth) *
                Number(movement),
              y:
                ((relY - container.offsetHeight / 2) / container.offsetHeight) *
                Number(movement),
              duration: 0.2,
            });
          });
        });
      });
    };

    parallaxIt();
  }, []);
  return (
    <div className="form-page__img bg-dark-1">
      <div className="form-page-composition" style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100%",
        position: "relative",
        maxWidth: "100%",
        margin: "0 auto"
      }}>
        {/* <div className="-bg">
          <img
            style={{ width: "100%" }}
            data-move="30"
            className="js-mouse-move"
            src="/assets/img/general/idea1.jpg"
            alt="bg"
          />
        </div> */}
        <div className="-el-1" style={{ maxWidth: "20%", margin: "0 auto" }}>
          <img
            style={{ width: "100%" }}
            data-move="20"
            className="js-mouse-move"
            src="/assets/img/home-9/hero/bg.png"
            alt="image"
          />
        </div>
        <div className="-el-2">
          <img
            data-move="40"
            className="js-mouse-move"
            src="/assets/img/general/image1.jpg"
            alt="icon"
          />
        </div>
        <div className="-el-3">
          <img
            data-move="40"
            className="js-mouse-move"
            src="/assets/img/general/idea2.jpg"
            alt="icon"
            style={{ width: "120px" }}
          />
        </div>
        <div className="-el-4">
          <img
            data-move="40"
            className="js-mouse-move"
            src="/assets/img/general/idea1.jpg"
            alt="icon"
            style={{ width: "120px" }}
          />
        </div>
      </div>
    </div>
  );
}
