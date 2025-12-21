import Lottie from "lottie-react"
import loadingAnimation from "../assets/loading.json"

function Loading() {
  return (
    <div className="min-h-[240px] flex flex-col items-center justify-center gap-3 pb-4 md:pb-14">
      <div className="w-64 md:w-[400px]">
        <Lottie animationData={loadingAnimation} 
        loop 
        className="w-64 md:w-[400px]"
        />
      </div>

      <p className="text-2xl md:text-3xl text-center font-medium bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
        Loading please wait....
      </p>
    </div>
  )
}

export default Loading