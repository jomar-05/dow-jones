import { DowJonesRiskEntityDto } from '../dto';

export const castDowJonesSearchResponse = (
  data: any,
): DowJonesRiskEntityDto[] =>
  data?.map((item: any) => ({
    id: item.id,
    type: item.type,
    attributes: {
      type: item.attributes.type,
      primaryName: item.attributes.primary_name,
      title: item.attributes?.title,
      countryTerritoryCode: item.attributes.country_territory_code,
      countryTerritoryName: item.attributes.country_territory_name,
      gender: item.attributes.gender,
      isSubsidiary: item.attributes.is_subsidiary,
      score: item.attributes.score,
      dateOfBirth:
        item.attributes?.date_of_birth?.map((birthDate: any) => ({
          day: birthDate?.day,
          month: birthDate?.month,
          year: birthDate?.year,
        })) || [],

      iconHints:
        item.attributes?.icon_hints?.map((iconHint: any) => ({
          iconHint,
          status: iconHint?.status,
        })) || [],
    },
  })) || [];
