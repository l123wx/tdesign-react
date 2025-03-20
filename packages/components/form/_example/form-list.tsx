import React, { useState } from 'react';
import { Form, Input, Button, Select } from 'tdesign-react';
import { MinusCircleIcon } from 'tdesign-icons-react';

const { FormItem, FormList } = Form;

const provinceOptions = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
  { label: '广州', value: 'gz' },
  { label: '深圳', value: 'sz' },
];

export default function BaseForm() {
  const [form] = Form.useForm();
  const [initData] = useState({
    address: [
      {
        province: 'bj',
        area: 'bj',
      },
      {
        province: 'sh',
        area: 'sh',
      },
      {
        province: 'gz',
        area: 'gz',
      },
      {
        province: 'sz',
        area: 'sz',
      },
    ],
  });

  const reset = () => {
    form.reset();
  };

  return (
    <Form form={form} initialData={initData} resetType="initial">
      <FormList name="address">
        {(fields, { add, remove }) => {
          console.log('fields', JSON.stringify(fields));
          return (
            <>
              {fields.map(({ key, name, ...restField }) => {
                console.log(key, name, restField);
                return (
                  <FormItem key={key}>
                    <FormItem>
                      <FormItem
                        {...restField}
                        name={[name, 'province']}
                        label={`省份${key}`}
                        rules={[{ required: true, type: 'error' }]}
                      >
                        <Select options={provinceOptions}></Select>
                      </FormItem>
                      <FormItem
                        {...restField}
                        name={[name, 'area']}
                        label="地区"
                        rules={[{ required: true, type: 'error' }]}
                      >
                        <Input placeholder="" />
                      </FormItem>

                      <FormItem>
                        <MinusCircleIcon size="20px" style={{ cursor: 'pointer' }} onClick={() => remove(name)} />
                      </FormItem>
                    </FormItem>
                  </FormItem>
                );
              })}
              <FormItem style={{ marginLeft: 100 }}>
                <Button theme="default" variant="dashed" onClick={() => add()}>
                  Add field
                </Button>
              </FormItem>
            </>
          );
        }}
      </FormList>
      <FormItem style={{ marginLeft: 100 }}>
        <Button onClick={() => reset()} theme="primary">
          reset
        </Button>
      </FormItem>
    </Form>
  );
}
