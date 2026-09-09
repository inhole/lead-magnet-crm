update public.html_templates
set input_schema = coalesce((
  select jsonb_agg(
    case
      when jsonb_typeof(field->'options') = 'array' and jsonb_typeof(field->'options'->0) = 'string'
        then jsonb_set(
          field,
          '{options}',
          (select jsonb_agg(jsonb_build_object('value', opt, 'label', opt)) from jsonb_array_elements_text(field->'options') as opt)
        )
      else field
    end
  )
  from jsonb_array_elements(input_schema) as field
), input_schema)
where jsonb_array_length(input_schema) > 0;
