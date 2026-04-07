import IndicatorsNavbar from '../../../components/Indicators/Header'

const IndicatorsPage = () => {
  return (
    <div className='fixed left-[80px] w-[calc(100%-80px)] top-[60px] h-[calc(100%-60px)] border-2 border-red-500'>
      <div className='w-full sticky top-0 z-10'>
        <IndicatorsNavbar />
      </div>
    </div>
  )
}

export default IndicatorsPage