import React from "react";
import TokenList from "../common/tokenList/tokenList";
const TokenListSection = () => {
  return (
    <div className="nyxBorderTop nyxContainer" id="tokenListSection">
      <div className="w-full nyxBorderX relative bg-[#070C10] bg-[url('../assets/images/bg_images/rightLighting.png')] bg-no-repeat bg-right-top">
        <div className="gridLine xl:py-[200px] lg:py-[176px] md:py-[152px] sm:py-[128px] py-[128px] px-[6px]">
          
          <div className="flex gap-[49px] px-[49px]">
            <TokenList />
          </div>
        </div>
        <div className="nyxNo  absolute right-0 bottom-0 xl:visible lg:invisible invisible flex items-center border-e-0 border-b-0">

        </div>
        <div className="nyxNo  absolute left-0 top-0 xl:invisible border-t-0 border-l-0">

        </div>
      </div>
    </div>
  );
};

export default TokenListSection;
