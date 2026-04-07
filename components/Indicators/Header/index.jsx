import RangeMonthPicker from "../../shared/RangeMonthPicker"

const IndicatorsNavbar = () => {
  return (
    <div className="flex items-center justify-between bg-white h-14 px-3">
      <div className="w-44">
        <RangeMonthPicker className="h-8 px-4" />
      </div>
    </div>
  )
}

export default IndicatorsNavbar