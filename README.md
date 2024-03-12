# Tabular Input for React

This is a React input component that allows manipulation of structured text in a spreadsheet-like fashion, so that you can quickly type new data in.

## Install

```
npm i -S @jstarpl/react-tabular-input
```

## Use

```JSX
    <TabularInput
        value={value}
        columns={[
            {
                label: "Column 1", // string or JSX
                tag: "C1", // needs to be unique
                width: "2fr", // CSS Grid column width string
            },
            {
                label: <>Column 2</>,
                tag: "C2",
                width: "100px",
            },
            {
                label: <em>Column 3</em>,
                tag: "C3",
                width: "3fr",
            },
        ]}
        showInsertButton
        draggable
        highlightRange={[0, 1]} // highlight rows from first index, up to, but excluding second index
        insertButtonLabel="Add new item" // string or JSX
        deleteButtonLabel={<DeleteIcon />}
        onChange={setValue}
        shouldAllowDeleteRow={shouldAllowDeleteRow}
    />
```

## Extras

- Odd and even rows are marked using `data-odd-even="odd"` and `data-odd-even="even"` attributes
- Highlighted rows are marked using `data-highlight` attribute

## Requirements

Requires React >= 16 and a build tool that can resolve CSS imports (like webpack's `css-loader` or `vite`).
