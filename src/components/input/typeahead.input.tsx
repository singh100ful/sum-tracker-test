import { AutoComplete, AutoCompleteProps, Input, Spin } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { ContactsInterface } from "../../interface/common";
import { debounce } from "lodash";
import { ListProductApi } from "../../services/products";
import { AxiosResponse } from "axios";

interface TypeAheadProps extends AutoCompleteProps {
  getSuggestions: (value: ListProductApi) => Promise<AxiosResponse>;
  onSelectValue: (value: string) => void;
}

const fixedContactParams = {
  paginate: false,
};

const isFullScreen = window.innerWidth > 768;

export const TypeAhead: React.FC<TypeAheadProps> = ({
  getSuggestions,
  onSelectValue,
  ...rest
}) => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<ContactsInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const debouncedSuggestions = useCallback(
    debounce((value: string) => {
      setLoading(true);
      loadContacts({ search: value });
    }, 500),
    [getSuggestions]
  );

  useEffect(() => {
    if (search) {
      debouncedSuggestions(search);
    } else {
      setSuggestions([]);
    }
  }, [search, debouncedSuggestions]);

  const loadContacts = (queryParams?: Record<string, any>) => {
    let query = queryParams || {};
    getSuggestions({
      query: { ...fixedContactParams, ...query },
    }).then((suggestions) => {
      setSuggestions(suggestions.data);
      setLoading(false);
    });
  };

  const onSelect = (value: string) => {
    const id = parseInt(value);
    const selectedSuggestion = suggestions.find(
      (suggestion) => suggestion.id === id
    );
    if (selectedSuggestion) {
      setSearch(selectedSuggestion.company_name);
      onSelectValue(value);
    }
  };

  const onChange = (value: string) => {
    setSearch(value);
    if (value === "") {
      onSelectValue("");
    }
  };

  const onFocus = () => {
    setLoading(true);
    loadContacts();
  };

  return (
    <div style={{ marginBottom: "1rem", width: isFullScreen ? "50%" : "100%" }}>
      <Spin spinning={loading}>
        <AutoComplete
          {...rest}
          options={suggestions.map((suggestion, index) => ({
            label: (
              <div key={index}>
                <strong>{suggestion.code}</strong>
                <br />
                <small>Company: {suggestion.company_name}</small>
              </div>
            ),
            value: suggestion.id.toString(),
          }))}
          onChange={onChange}
          onSelect={onSelect}
          style={{ width: "100%" }}
          value={search}
        >
          <Input.Search
            size="large"
            onFocus={onFocus}
            disabled={loading}
            enterButton
            allowClear
          />
        </AutoComplete>
      </Spin>
    </div>
  );
};
