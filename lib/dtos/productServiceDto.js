

export const productServiceDto = (data = []) => {
  console.log('productServiceDto', data)
  return data.map(item => ({
    guid: item?.guid,
    name: item?.Naimenovanie, 
    tsena_za_ed: item?.TSena_za_ed,
    unit: item?.unit, 
    discount: item?.Skidka,  
    nds: item?.NDS,
    kolvo: item?.Kol_vo,
    summa: item?.Summa,
    status: item?.Status,
    unit_name: item?.unit_name,
    group_product_and_service_id: item?.group_product_and_service_id,
    unit_of_measurement_id: item?.unit_of_measurement_id,
  }))
}