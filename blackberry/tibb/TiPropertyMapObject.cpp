/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2012 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

#include "TiPropertyMapObject.h"
#include "TiUIBase.h"

TiPropertyMapObject::TiPropertyMapObject(const char* name)
    : TiObject(name)
{
    nativeObject_ = NULL;
    parentObject_ = NULL;
}

TiPropertyMapObject::~TiPropertyMapObject()
{
    if (nativeObject_ != NULL)
    {
        nativeObject_->release();
        nativeObject_ = NULL;
    }
}

TiPropertyMapObject* TiPropertyMapObject::addProperty(TiUIBase* parent, const char* name, int propertyNumber,
        MODIFY_VALUE_CALLBACK cb, void* context)
{
    TiPropertyMapObject* object = new TiPropertyMapObject(name);
    object->propertyNumber_ = propertyNumber;
    object->callback_ = cb;
    object->context_ = context;
    parent->addMember(object);
    object->parentObject_ = parent;
    object->nativeObject_ = parent->getNativeObject();
    return object;
}

VALUE_MODIFY TiPropertyMapObject::onValueChange(Handle<Value> oldValue, Handle<Value> newValue)
{
    HandleScope handleScope;
    VALUE_MODIFY modify = TiObject::onValueChange(oldValue, newValue);
    Handle<String> stringValue;
    if (modify != VALUE_MODIFY_ALLOW)
    {
        return modify;
    }
    TiObject* value = new TiObject;
    value->setValue(newValue);
    modify = (callback_)(propertyNumber_, value, context_);
    if (modify == VALUE_MODIFY_ALLOW)
    {
        forceSetValue(value->getValue());
    }
    value->release();
    return modify;
}

Handle<Value> TiPropertyMapObject::getValue() const
{

    TiObject* value = new TiObject;
    NativeObject* nativeObject = nativeObject_;
    if (nativeObject == NULL)
    {
        nativeObject = parentObject_->getNativeObject();
        if (nativeObject == NULL)
        {
            return Undefined();
        }
    }
    int error = nativeObject->getPropertyValue(propertyNumber_, value);
    nativeObject->release();
    if (error != NATIVE_ERROR_OK)
    {
        value->release();
        return Undefined();
    }
    Handle<Value> v8val = value->getValue();
    value->release();
    return v8val;
}
