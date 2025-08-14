package com.leduc.spring.exception;

import java.util.List;

public class ImportException extends RuntimeException {
    private final List<String> errors;

    public ImportException(List<String> errors) {
        super("Some students could not be imported");
        this.errors = errors;
    }

    public List<String> getErrors() {
        return errors;
    }
}