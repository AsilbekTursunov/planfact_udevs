import { formatDateRu } from "../../utils/helpers"

export const shipmentsDto = (shipments) => {
  return shipments?.map(shipment => ({
    ...shipment,
    guid: shipment?.guid,
    data_nachisleniya: shipment?.data_nachisleniya,
    data_obnovleniya: shipment?.data_obnovleniya,
    data_operatsii: shipment?.data_operatsii,
    data_sozdaniya: shipment?.data_sozdaniya, 
    operationDate: formatDateRu(shipment?.data_operatsii),
    tip: shipment?.tip?.[0],
    my_account_name: shipment?.my_accounts_name,  
    payment_confirmed: shipment?.payment_confirmed,
    counterparty: shipment.counterparties_name || '',
    counterpartyId: shipment.counterparties_id || null,  
    my_accounts_id: shipment?.my_accounts_id, 
    summa: shipment?.summa, 
    currency: shipment?.currenies_kod || shipment?.currenies_id_data?.nazvanie || '',
    currencyId: shipment?.currenies_id || null,
  })) || []
}