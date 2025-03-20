import React, { useState, useEffect, ReactNode, ReactElement, useCallback } from 'react';
import { get } from 'lodash-es';
import { SelectKeysType, SelectOption, SelectValue } from '../type';
import { getValueToOption } from '../util/helper';
import Option from '../base/Option';

/**
 * TODO
 * 1. 这里 calcSelectedOptions 的入参和逻辑与 helper.ts 中的 getSelectedOptions 不一样，需要理解一下为什么不一致，是否能改为一致，并且复用
 * 2. valueToOption
      currentOptions
      tmpPropOptions
      selectedOptions
    之前的类型为 any[]，现在改为在初始化时调用方法生成，会进行类型推导，导致原来使用到这些参数的地方出现类型错误（就是外面使用的地方类型没有处理好
 */

// 处理 options 的逻辑
function UseOptions(
  keys: SelectKeysType,
  options: SelectOption[],
  children: ReactNode,
  valueType: 'object' | 'value',
  value: SelectValue<SelectOption>,
  reserveKeyword: boolean,
) {
  const calcSelectedOptions = useCallback(
    ({
      oldSelectedOptions,
      valueToOption,
    }: {
      oldSelectedOptions: SelectOption[];
      valueToOption: Record<string, SelectOption>;
    }) => {
      const valueKey = keys?.value || 'value';
      const labelKey = keys?.label || 'label';
      if (Array.isArray(value)) {
        return value
          .map((item: SelectValue<SelectOption>) => {
            if (valueType === 'value') {
              return (
                valueToOption[item as string | number] ||
                oldSelectedOptions.find((option) => get(option, valueKey) === item) || {
                  [valueKey]: item,
                  [labelKey]: item,
                }
              );
            }
            return item;
          })
          .filter(Boolean);
      }

      if (value !== undefined && value !== null) {
        if (valueType === 'value') {
          return [
            valueToOption[value as string | number] ||
              oldSelectedOptions.find((option) => get(option, valueKey) === value) || {
                [valueKey]: value,
                [labelKey]: value,
              },
          ].filter(Boolean);
        }
        return [value];
      }
      return [];
    },
    [keys, value, valueType],
  );

  const calcTransformedOptions = useCallback(
    ({ currentOptions }: { currentOptions: SelectOption[] }) => {
      let transformedOptions = options;

      const arrayChildren = React.Children.toArray(children);
      const optionChildren = arrayChildren.filter((v: ReactElement) => v.type === Option);
      const isChildrenFilterable = arrayChildren.length > 0 && optionChildren.length === arrayChildren.length;
      if (reserveKeyword && currentOptions.length && isChildrenFilterable) return;

      if (isChildrenFilterable) {
        transformedOptions = arrayChildren?.map<SelectOption>((v) => {
          if (React.isValidElement<SelectOption>(v)) {
            return {
              ...v.props,
              label: v.props.label || v.props.children,
            };
          }
          return { label: v };
        });
      }
      if (keys) {
        // 如果有定制 keys 先做转换
        transformedOptions = transformedOptions?.map<SelectOption>((option) => ({
          ...option,
          value: get(option, keys?.value || 'value'),
          label: get(option, keys?.label || 'label'),
        }));
      }
      return transformedOptions;
    },
    [options, children, keys, reserveKeyword],
  );

  const [valueToOption, setValueToOption] = useState(
    () => getValueToOption(children as ReactElement, options as any, keys) || {},
  );
  const [currentOptions, setCurrentOptions] = useState<any[]>(() => calcTransformedOptions({ currentOptions: [] }));
  const [tmpPropOptions, setTmpPropOptions] = useState<any[]>(() => calcTransformedOptions({ currentOptions: [] }));
  const [selectedOptions, setSelectedOptions] = useState<any[]>(() =>
    calcSelectedOptions({
      oldSelectedOptions: [],
      valueToOption,
    }),
  );

  // 处理设置 option 的逻辑
  useEffect(() => {
    const transformedOptions = calcTransformedOptions({ currentOptions: options });

    setCurrentOptions(transformedOptions);
    setTmpPropOptions(transformedOptions);
  }, [options, keys, children, reserveKeyword, calcTransformedOptions]);

  useEffect(() => {
    setValueToOption(getValueToOption(children as ReactElement, options as any, keys) || {});
  }, [children, options, keys]);

  // 同步 value 对应的 options
  useEffect(() => {
    setSelectedOptions((oldSelectedOptions: SelectOption[]) =>
      calcSelectedOptions({
        oldSelectedOptions,
        valueToOption,
      }),
    );
  }, [valueToOption, setSelectedOptions, calcSelectedOptions]);

  return {
    currentOptions,
    setCurrentOptions,
    tmpPropOptions,
    setTmpPropOptions,
    valueToOption,
    setValueToOption,
    selectedOptions,
    setSelectedOptions,
  };
}

export default UseOptions;
